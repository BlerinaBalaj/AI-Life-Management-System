package com.ailife.management.fitness;

import com.ailife.management.common.TenantScopedEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "exercises")
public class Exercise extends TenantScopedEntity {
    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 80)
    private String muscleGroup;

    @Column(length = 80)
    private String equipment;

    @Column(length = 1000)
    private String instructions;
}
