package com.zenox.billing.mapper;

import com.zenox.billing.dto.BillingCycleHeader;
import com.zenox.billing.dto.BillingItemSummary;
import com.zenox.billing.dto.PaymentRecordSummary;
import com.zenox.common.security.DataScope;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingMapper {
  @Select("""
      SELECT
        bc.id AS cycleId,
        sp.id AS studentId,
        sp.name AS studentName,
        sp.parent_name AS parentName,
        sp.parent_phone AS parentPhone,
        bc.cycle_month AS cycleMonth,
        bc.total_amount AS totalAmount,
        COALESCE(payments.paid_amount, 0) AS paidAmount,
        GREATEST(bc.total_amount - COALESCE(payments.paid_amount, 0), 0) AS unpaidAmount,
        bc.status,
        COALESCE(items.item_count, 0) AS itemCount
      FROM billing_cycle bc
      JOIN student_profile sp
        ON sp.id = bc.student_id
       AND sp.deleted_at IS NULL
      LEFT JOIN (
        SELECT billing_cycle_id, COUNT(*) AS item_count
        FROM billing_item
        WHERE deleted_at IS NULL
        GROUP BY billing_cycle_id
      ) items
        ON items.billing_cycle_id = bc.id
      LEFT JOIN (
        SELECT billing_cycle_id, SUM(amount) AS paid_amount
        FROM payment_record
        WHERE deleted_at IS NULL
        GROUP BY billing_cycle_id
      ) payments
        ON payments.billing_cycle_id = bc.id
      WHERE bc.tenant_id = #{scope.tenantId}
        AND bc.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN class_teacher scoped_ct
              ON scoped_ct.class_group_id = scoped_cm.class_group_id
             AND scoped_ct.teacher_user_id = #{scope.userId}
             AND scoped_ct.deleted_at IS NULL
            WHERE scoped_cm.student_id = sp.id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.student} = TRUE AND sp.user_id = #{scope.userId})
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM parent_student scoped_ps
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_ps.student_id = sp.id
              AND scoped_ps.deleted_at IS NULL
          ))
        )
      ORDER BY bc.cycle_month DESC, sp.name ASC
      """)
  List<BillingCycleHeader> listCycles(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        bc.id AS cycleId,
        sp.id AS studentId,
        sp.name AS studentName,
        sp.parent_name AS parentName,
        sp.parent_phone AS parentPhone,
        bc.cycle_month AS cycleMonth,
        bc.total_amount AS totalAmount,
        COALESCE(payments.paid_amount, 0) AS paidAmount,
        GREATEST(bc.total_amount - COALESCE(payments.paid_amount, 0), 0) AS unpaidAmount,
        bc.status,
        COALESCE(items.item_count, 0) AS itemCount
      FROM billing_cycle bc
      JOIN student_profile sp
        ON sp.id = bc.student_id
       AND sp.deleted_at IS NULL
      LEFT JOIN (
        SELECT billing_cycle_id, COUNT(*) AS item_count
        FROM billing_item
        WHERE deleted_at IS NULL
          AND billing_cycle_id = #{cycleId}
        GROUP BY billing_cycle_id
      ) items
        ON items.billing_cycle_id = bc.id
      LEFT JOIN (
        SELECT billing_cycle_id, SUM(amount) AS paid_amount
        FROM payment_record
        WHERE deleted_at IS NULL
          AND billing_cycle_id = #{cycleId}
        GROUP BY billing_cycle_id
      ) payments
        ON payments.billing_cycle_id = bc.id
      WHERE bc.id = #{cycleId}
        AND bc.tenant_id = #{scope.tenantId}
        AND bc.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN class_teacher scoped_ct
              ON scoped_ct.class_group_id = scoped_cm.class_group_id
             AND scoped_ct.teacher_user_id = #{scope.userId}
             AND scoped_ct.deleted_at IS NULL
            WHERE scoped_cm.student_id = sp.id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.student} = TRUE AND sp.user_id = #{scope.userId})
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM parent_student scoped_ps
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_ps.student_id = sp.id
              AND scoped_ps.deleted_at IS NULL
          ))
        )
      LIMIT 1
      """)
  BillingCycleHeader findCycleHeader(@Param("scope") DataScope scope, @Param("cycleId") Long cycleId);

  @Select("""
      SELECT
        bi.id,
        bi.lesson_id AS lessonId,
        bi.title,
        bi.amount,
        l.starts_at AS lessonStartsAt,
        l.lesson_hours AS lessonHours,
        l.unit_price AS unitPrice
      FROM billing_item bi
      LEFT JOIN lesson l
        ON l.id = bi.lesson_id
       AND l.deleted_at IS NULL
      WHERE bi.tenant_id = #{tenantId}
        AND bi.billing_cycle_id = #{cycleId}
        AND bi.deleted_at IS NULL
      ORDER BY COALESCE(l.starts_at, bi.created_at) ASC, bi.created_at ASC
      """)
  List<BillingItemSummary> listItems(@Param("tenantId") Long tenantId, @Param("cycleId") Long cycleId);

  @Select("""
      SELECT
        id,
        amount,
        paid_at AS paidAt,
        method,
        note
      FROM payment_record
      WHERE tenant_id = #{tenantId}
        AND billing_cycle_id = #{cycleId}
        AND deleted_at IS NULL
      ORDER BY paid_at DESC, created_at DESC
      """)
  List<PaymentRecordSummary> listPayments(@Param("tenantId") Long tenantId, @Param("cycleId") Long cycleId);

  @Insert("""
      INSERT INTO payment_record (id, tenant_id, billing_cycle_id, amount, paid_at, method, note)
      VALUES (#{id}, #{tenantId}, #{cycleId}, #{amount}, #{paidAt}, #{method}, #{note})
      """)
  int insertPayment(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("cycleId") Long cycleId,
      @Param("amount") BigDecimal amount,
      @Param("paidAt") LocalDateTime paidAt,
      @Param("method") String method,
      @Param("note") String note
  );

  @Select("""
      SELECT billing_cycle_id
      FROM payment_record
      WHERE id = #{paymentId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  Long findPaymentCycleId(@Param("tenantId") Long tenantId, @Param("paymentId") Long paymentId);

  @Update("""
      UPDATE payment_record
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{paymentId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      """)
  int softDeletePayment(@Param("tenantId") Long tenantId, @Param("paymentId") Long paymentId);

  @Update("""
      UPDATE billing_cycle bc
      LEFT JOIN (
        SELECT billing_cycle_id, COALESCE(SUM(amount), 0) AS total_amount
        FROM billing_item
        WHERE deleted_at IS NULL
          AND billing_cycle_id = #{cycleId}
        GROUP BY billing_cycle_id
      ) items
        ON items.billing_cycle_id = bc.id
      LEFT JOIN (
        SELECT billing_cycle_id, COALESCE(SUM(amount), 0) AS paid_amount
        FROM payment_record
        WHERE deleted_at IS NULL
          AND billing_cycle_id = #{cycleId}
        GROUP BY billing_cycle_id
      ) payments
        ON payments.billing_cycle_id = bc.id
      SET bc.total_amount = COALESCE(items.total_amount, 0),
          bc.status = CASE
            WHEN COALESCE(items.total_amount, 0) = 0 AND COALESCE(payments.paid_amount, 0) = 0 THEN 'DRAFT'
            WHEN COALESCE(payments.paid_amount, 0) = 0 THEN 'DRAFT'
            WHEN COALESCE(payments.paid_amount, 0) >= COALESCE(items.total_amount, 0) THEN 'PAID'
            ELSE 'PARTIALLY_PAID'
          END,
          bc.updated_at = CURRENT_TIMESTAMP
      WHERE bc.id = #{cycleId}
        AND bc.tenant_id = #{tenantId}
        AND bc.deleted_at IS NULL
      """)
  int recalculateCycle(@Param("tenantId") Long tenantId, @Param("cycleId") Long cycleId);
}
