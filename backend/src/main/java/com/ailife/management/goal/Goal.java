package com.ailife.management.goal;

import com.ailife.management.category.Category;
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
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "goals")
public class Goal extends TenantScopedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 40)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private int priority = 3;

    private LocalDate targetDate;
}
