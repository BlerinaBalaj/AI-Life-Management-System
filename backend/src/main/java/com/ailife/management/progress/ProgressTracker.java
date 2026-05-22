package com.ailife.management.progress;

import com.ailife.management.common.TenantScopedEntity;
import com.ailife.management.goal.Goal;
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
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "progress_trackers")
public class ProgressTracker extends TenantScopedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @Column(nullable = false)
    private LocalDate trackedDate;

    @Column(nullable = false, length = 100)
    private String metricName;

    @Column(nullable = false)
    private double metricValue;

    @Column(length = 40)
    private String unit;

    @Column(length = 800)
    private String notes;
}
