package com.ailife.management.nutrition;

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
@Table(name = "food_logs")
public class FoodLog extends TenantScopedEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime consumedAt;

    @Column(nullable = false, length = 160)
    private String foodName;

    @Column(length = 80)
    private String mealType;

    private Integer calories;
    private Integer proteinGrams;
    private Integer carbsGrams;
    private Integer fatGrams;
}
