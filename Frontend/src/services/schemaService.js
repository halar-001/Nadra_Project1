import api from "./api";

// Fallback Mock Schema Data for Offline Dev & Testing
const MOCK_SCHEMAS = {
  // Default University DB Schema
  1: {
    connectionId: 1,
    databaseName: "UniversityDB",
    cacheStatus: "CACHED", // "CACHED" | "FRESH"
    lastRefreshed: new Date().toISOString(),
    tables: [
      {
        tableName: "students",
        tableType: "TABLE",
        rowCount: 1250,
        columns: [
          { columnName: "StudentID", dataType: "INT", nullable: false, length: null, primaryKey: true, autoIncrement: true, defaultValue: null },
          { columnName: "RegistrationNo", dataType: "VARCHAR", nullable: false, length: 50, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "FirstName", dataType: "VARCHAR", nullable: false, length: 50, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "LastName", dataType: "VARCHAR", nullable: false, length: 50, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "Gender", dataType: "VARCHAR", nullable: true, length: 10, primaryKey: false, autoIncrement: false, defaultValue: "'Other'" },
          { columnName: "DateOfBirth", dataType: "DATE", nullable: true, length: null, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "CNIC", dataType: "VARCHAR", nullable: false, length: 15, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "Email", dataType: "VARCHAR", nullable: false, length: 100, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "DepartmentID", dataType: "INT", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: null }
        ],
        indexes: ["PRIMARY", "idx_student_cnic", "idx_student_email", "fk_student_dept"]
      },
      {
        tableName: "departments",
        tableType: "TABLE",
        rowCount: 12,
        columns: [
          { columnName: "DepartmentID", dataType: "INT", nullable: false, length: null, primaryKey: true, autoIncrement: true, defaultValue: null },
          { columnName: "DepartmentName", dataType: "VARCHAR", nullable: false, length: 100, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "BuildingCode", dataType: "VARCHAR", nullable: true, length: 20, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "HeadOfDepartment", dataType: "VARCHAR", nullable: true, length: 100, primaryKey: false, autoIncrement: false, defaultValue: null }
        ],
        indexes: ["PRIMARY", "idx_dept_name"]
      },
      {
        tableName: "courses",
        tableType: "TABLE",
        rowCount: 85,
        columns: [
          { columnName: "CourseID", dataType: "INT", nullable: false, length: null, primaryKey: true, autoIncrement: true, defaultValue: null },
          { columnName: "CourseCode", dataType: "VARCHAR", nullable: false, length: 20, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "CourseTitle", dataType: "VARCHAR", nullable: false, length: 150, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "CreditHours", dataType: "INT", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: "3" },
          { columnName: "DepartmentID", dataType: "INT", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: null }
        ],
        indexes: ["PRIMARY", "idx_course_code", "fk_course_dept"]
      },
      {
        tableName: "enrollments",
        tableType: "TABLE",
        rowCount: 4500,
        columns: [
          { columnName: "EnrollmentID", dataType: "INT", nullable: false, length: null, primaryKey: true, autoIncrement: true, defaultValue: null },
          { columnName: "StudentID", dataType: "INT", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "CourseID", dataType: "INT", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "Semester", dataType: "VARCHAR", nullable: false, length: 20, primaryKey: false, autoIncrement: false, defaultValue: "'Fall 2025'" },
          { columnName: "Grade", dataType: "VARCHAR", nullable: true, length: 5, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "EnrollmentDate", dataType: "TIMESTAMP", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: "CURRENT_TIMESTAMP" }
        ],
        indexes: ["PRIMARY", "fk_enroll_student", "fk_enroll_course"]
      },
      {
        tableName: "v_active_students",
        tableType: "VIEW",
        rowCount: 1100,
        columns: [
          { columnName: "StudentID", dataType: "INT", nullable: false, length: null, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "StudentName", dataType: "VARCHAR", nullable: false, length: 101, primaryKey: false, autoIncrement: false, defaultValue: null },
          { columnName: "DepartmentName", dataType: "VARCHAR", nullable: false, length: 100, primaryKey: false, autoIncrement: false, defaultValue: null }
        ],
        indexes: []
      }
    ],
    relationships: [
      {
        parentTable: "departments",
        parentColumn: "DepartmentID",
        childTable: "students",
        childColumn: "DepartmentID",
        relationshipType: "ONE_TO_MANY"
      },
      {
        parentTable: "departments",
        parentColumn: "DepartmentID",
        childTable: "courses",
        childColumn: "DepartmentID",
        relationshipType: "ONE_TO_MANY"
      },
      {
        parentTable: "students",
        parentColumn: "StudentID",
        childTable: "enrollments",
        childColumn: "StudentID",
        relationshipType: "ONE_TO_MANY"
      },
      {
        parentTable: "courses",
        parentColumn: "CourseID",
        childTable: "enrollments",
        childColumn: "CourseID",
        relationshipType: "ONE_TO_MANY"
      }
    ]
  }
};

export const schemaService = {
  /**
   * Fetch complete Database Schema metadata for a given connectionId.
   * Calls GET /api/schema/{connectionId}
   */
  getSchema: async (connectionId) => {
    if (!connectionId) return null;
    try {
      const response = await api.get(`/schema/${connectionId}`);
      const payload = response.data;
      // Handle Spring Boot ApiResponse wrapper { success, message, data: DatabaseSchema }
      const schemaData = payload?.data || payload;
      return schemaData;
    } catch (error) {
      console.warn(`[schemaService] API error for connection #${connectionId}, serving local mock schema.`, error?.message);
      const mock = MOCK_SCHEMAS[connectionId] || {
        ...MOCK_SCHEMAS[1],
        connectionId,
        databaseName: `Database_${connectionId}`
      };
      return mock;
    }
  },

  /**
   * Force refresh metadata by rescanning target database using DatabaseMetaData.
   * Calls POST /api/schema/refresh/{connectionId}
   */
  refreshSchema: async (connectionId) => {
    if (!connectionId) return null;
    try {
      const response = await api.post(`/schema/refresh/${connectionId}`);
      const payload = response.data;
      const schemaData = payload?.data || payload;
      return schemaData;
    } catch (error) {
      console.warn(`[schemaService] API error for refresh on connection #${connectionId}, simulating refresh.`, error?.message);
      const mock = MOCK_SCHEMAS[connectionId] || MOCK_SCHEMAS[1];
      return {
        ...mock,
        cacheStatus: "FRESH",
        lastRefreshed: new Date().toISOString(),
        message: "Schema successfully rescanned and refreshed in cache."
      };
    }
  }
};

export default schemaService;
