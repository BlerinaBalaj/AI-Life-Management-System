package com.ailife.management.ai;

import com.ailife.management.common.TenantScopedEntity;
import com.ailife.management.user.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "ai_request_logs")
public class AIRequestLog extends TenantScopedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String requestType;

    @Column(nullable = false, length = 120)
    private String model;

    @Column(columnDefinition = "TEXT")
    private String inputJson;

    @Column(columnDefinition = "TEXT")
    private String outputJson;

    @Column(nullable = false)
    private boolean successful;

    @Column(length = 1000)
    private String errorMessage;
}
