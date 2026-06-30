package com.zenox.homework.dto;

import java.math.BigDecimal;

public record ReviewHomeworkRequest(
    BigDecimal score,
    String comment,
    String mistakeTags,
    Boolean needsCorrection,
    Boolean excellent
) {
}
