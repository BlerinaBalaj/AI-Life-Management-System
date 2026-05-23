package com.ailife.management.wellbeing;

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
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "stress_logs")
public class StressLog extends TenantScopedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime loggedAt;

    @Column(nullable = false)
    private int stressLevel;

    @Column(length = 120)
    private String trigger;

    @Column(length = 1000)
    private String copingAction;
}
