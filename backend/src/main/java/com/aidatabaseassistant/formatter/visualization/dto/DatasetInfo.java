package com.aidatabaseassistant.formatter.visualization.dto;

import java.util.List;

public class DatasetInfo {
    private String label;
    private List<Number> data;

    public DatasetInfo() {}

    public DatasetInfo(String label, List<Number> data) {
        this.label = label;
        this.data = data;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public List<Number> getData() {
        return data;
    }

    public void setData(List<Number> data) {
        this.data = data;
    }
}
