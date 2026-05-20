package com.ailife.management.category;

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
@Table(name = "categories")
public class Category extends TenantScopedEntity {
    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(length = 20)
    private String color;
}
