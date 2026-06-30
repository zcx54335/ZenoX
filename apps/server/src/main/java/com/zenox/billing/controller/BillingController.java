package com.zenox.billing.controller;

import com.zenox.auth.security.RequirePermission;
import com.zenox.billing.dto.BillingCycleDetail;
import com.zenox.billing.dto.BillingCycleHeader;
import com.zenox.billing.dto.RecordPaymentRequest;
import com.zenox.billing.service.BillingService;
import com.zenox.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
  private final BillingService billingService;

  public BillingController(BillingService billingService) {
    this.billingService = billingService;
  }

  @GetMapping
  @RequirePermission("billing:view")
  public ApiResponse<List<BillingCycleHeader>> list() {
    return ApiResponse.ok(billingService.list());
  }

  @GetMapping("/{cycleId}")
  @RequirePermission("billing:view")
  public ApiResponse<BillingCycleDetail> detail(@PathVariable Long cycleId) {
    return ApiResponse.ok(billingService.detail(cycleId));
  }

  @PostMapping("/{cycleId}/payments")
  @RequirePermission("billing:manage")
  public ApiResponse<BillingCycleDetail> recordPayment(
      @PathVariable Long cycleId,
      @Valid @RequestBody RecordPaymentRequest request
  ) {
    return ApiResponse.ok(billingService.recordPayment(cycleId, request));
  }

  @DeleteMapping("/payments/{paymentId}")
  @RequirePermission("billing:manage")
  public ApiResponse<BillingCycleDetail> undoPayment(@PathVariable Long paymentId) {
    return ApiResponse.ok(billingService.undoPayment(paymentId));
  }

  @GetMapping("/{cycleId}/statement.pdf")
  @RequirePermission("billing:export")
  public ResponseEntity<byte[]> statementPdf(@PathVariable Long cycleId) {
    byte[] content = billingService.statementPdf(cycleId);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
            .filename("zenox-billing-" + cycleId + ".pdf")
            .build()
            .toString())
        .body(content);
  }
}
