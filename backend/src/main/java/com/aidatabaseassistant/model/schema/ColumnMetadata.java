package com.aidatabaseassistant.model.schema;

public class ColumnMetadata {
    private String columnName;
    private String dataType;
    private int length;
    private boolean nullable;
    private String defaultValue;
    private boolean autoIncrement;

    public ColumnMetadata() {
    }

    public ColumnMetadata(String columnName, String dataType, int length, boolean nullable, String defaultValue, boolean autoIncrement) {
        this.columnName = columnName;
        this.dataType = dataType;
        this.length = length;
        this.nullable = nullable;
        this.defaultValue = defaultValue;
        this.autoIncrement = autoIncrement;
    }

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public boolean isNullable() {
        return nullable;
    }

    public void setNullable(boolean nullable) {
        this.nullable = nullable;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public boolean isAutoIncrement() {
        return autoIncrement;
    }

    public void setAutoIncrement(boolean autoIncrement) {
        this.autoIncrement = autoIncrement;
    }

    @Override
    public String toString() {
        return "ColumnMetadata{" +
                "columnName='" + columnName + '\'' +
                ", dataType='" + dataType + '\'' +
                ", length=" + length +
                ", nullable=" + nullable +
                ", defaultValue='" + defaultValue + '\'' +
                ", autoIncrement=" + autoIncrement +
                '}';
    }
}
