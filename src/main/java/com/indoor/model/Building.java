package com.indoor.model;

import java.io.Serializable;

public class Building implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private String code;
    private String description;
    private String category;
    private int floorsCount;
    private String iconName;

    public Building() {}

    public Building(String id, String name, String code, String description, String category, int floorsCount, String iconName) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.category = category;
        this.floorsCount = floorsCount;
        this.iconName = iconName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getFloorsCount() { return floorsCount; }
    public void setFloorsCount(int floorsCount) { this.floorsCount = floorsCount; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }
}
