package com.ailife.management.user;

import com.ailife.management.common.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private RoleName name;

    public Role(RoleName name) {
        this.name = name;
    }
}
