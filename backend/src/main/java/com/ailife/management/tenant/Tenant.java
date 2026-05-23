package com.ailife.management.tenant;

import com.ailife.management.common.BaseEntity;
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
@Table(name = "tenants")
public class Tenant extends BaseEntity {
    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false)
    private boolean active = true;

    public Tenant(String name, String slug) {
        this.name = name;
        this.slug = slug;
    }
}
