package com.aidatabaseassistant.model.schema;

public class RelationshipMetadata {
    private String parentTable;
    private String parentColumn;
    private String childTable;
    private String childColumn;
    private RelationshipType relationshipType;

    public RelationshipMetadata() {
    }

    public RelationshipMetadata(String parentTable, String parentColumn, String childTable, String childColumn, RelationshipType relationshipType) {
        this.parentTable = parentTable;
        this.parentColumn = parentColumn;
        this.childTable = childTable;
        this.childColumn = childColumn;
        this.relationshipType = relationshipType;
    }

    public String getParentTable() {
        return parentTable;
    }

    public void setParentTable(String parentTable) {
        this.parentTable = parentTable;
    }

    public String getParentColumn() {
        return parentColumn;
    }

    public void setParentColumn(String parentColumn) {
        this.parentColumn = parentColumn;
    }

    public String getChildTable() {
        return childTable;
    }

    public void setChildTable(String childTable) {
        this.childTable = childTable;
    }

    public String getChildColumn() {
        return childColumn;
    }

    public void setChildColumn(String childColumn) {
        this.childColumn = childColumn;
    }

    public RelationshipType getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(RelationshipType relationshipType) {
        this.relationshipType = relationshipType;
    }

    @Override
    public String toString() {
        return "RelationshipMetadata{" +
                "parentTable='" + parentTable + '\'' +
                ", parentColumn='" + parentColumn + '\'' +
                ", childTable='" + childTable + '\'' +
                ", childColumn='" + childColumn + '\'' +
                ", relationshipType=" + relationshipType +
                '}';
    }
}
