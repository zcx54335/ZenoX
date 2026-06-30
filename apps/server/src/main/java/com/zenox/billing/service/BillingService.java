package com.zenox.billing.service;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.zenox.billing.dto.BillingCycleDetail;
import com.zenox.billing.dto.BillingCycleHeader;
import com.zenox.billing.dto.RecordPaymentRequest;
import com.zenox.billing.mapper.BillingMapper;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingService {
  private final BillingMapper billingMapper;
  private final CurrentUser currentUser;

  public BillingService(BillingMapper billingMapper, CurrentUser currentUser) {
    this.billingMapper = billingMapper;
    this.currentUser = currentUser;
  }

  public List<BillingCycleHeader> list() {
    return billingMapper.listCycles(currentUser.tenantId());
  }

  public BillingCycleDetail detail(Long cycleId) {
    Long tenantId = currentUser.tenantId();
    BillingCycleHeader header = billingMapper.findCycleHeader(tenantId, cycleId);
    if (header == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Billing cycle not found");
    }
    return BillingCycleDetail.from(
        header,
        billingMapper.listItems(tenantId, cycleId),
        billingMapper.listPayments(tenantId, cycleId)
    );
  }

  @Transactional
  public BillingCycleDetail recordPayment(Long cycleId, RecordPaymentRequest request) {
    Long tenantId = currentUser.tenantId();
    BillingCycleHeader header = billingMapper.findCycleHeader(tenantId, cycleId);
    if (header == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Billing cycle not found");
    }
    LocalDateTime paidAt = request.paidAt() == null ? LocalDateTime.now() : request.paidAt();
    billingMapper.insertPayment(
        IdWorker.getId(),
        tenantId,
        cycleId,
        request.amount(),
        paidAt,
        normalize(request.method(), "WECHAT"),
        normalize(request.note(), null)
    );
    billingMapper.recalculateCycle(tenantId, cycleId);
    return detail(cycleId);
  }

  @Transactional
  public BillingCycleDetail undoPayment(Long paymentId) {
    Long tenantId = currentUser.tenantId();
    Long cycleId = billingMapper.findPaymentCycleId(tenantId, paymentId);
    if (cycleId == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Payment record not found");
    }
    billingMapper.softDeletePayment(tenantId, paymentId);
    billingMapper.recalculateCycle(tenantId, cycleId);
    return detail(cycleId);
  }

  public byte[] statementPdf(Long cycleId) {
    return BillingStatementPdfBuilder.build(detail(cycleId));
  }

  private String normalize(String value, String fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return value.trim();
  }
}
