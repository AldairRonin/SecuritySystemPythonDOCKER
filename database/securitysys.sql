CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL UNIQUE,
    "email" VARCHAR(255) UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    PRIMARY KEY ("id"),

    CHECK ("role" IN (
        'PARENT',
        'TRUSTED_PERSON',
        'SECURITY',
        'ADMIN'
    )),

    CHECK ("status" IN (
        'ACTIVE',
        'BLOCKED'
    ))
);


CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "class_name" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    PRIMARY KEY ("id"),

    CHECK ("status" IN (
        'ACTIVE',
        'INACTIVE'
    ))
);


CREATE TABLE "guardian_student" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "relationship_type" VARCHAR(30) NOT NULL,
    "verification_status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL,

    PRIMARY KEY ("id"),

    UNIQUE ("guardian_id", "student_id"),

    CHECK ("relationship_type" IN (
        'FATHER',
        'MOTHER',
        'GRANDFATHER',
        'GRANDMOTHER',
        'GUARDIAN'
    )),

    CHECK ("verification_status" IN (
        'PENDING',
        'APPROVED',
        'REJECTED'
    ))
);


CREATE TABLE "verification_requests" (
    "id" UUID NOT NULL,
    "guardian_student_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP NOT NULL,
    "reviewed_at" TIMESTAMP,

    PRIMARY KEY ("id"),

    CHECK ("status" IN (
        'PENDING',
        'APPROVED',
        'REJECTED'
    ))
);


CREATE TABLE "qr_codes" (
    "id" UUID NOT NULL,
    "guardian_student_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL UNIQUE,
    "expires_at" TIMESTAMP NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "used_at" TIMESTAMP,

    PRIMARY KEY ("id"),

    CHECK ("status" IN (
        'ACTIVE',
        'USED',
        'EXPIRED',
        'REVOKED'
    ))
);


CREATE TABLE "access_logs" (
    "id" UUID NOT NULL,
    "qr_code_id" UUID NOT NULL,
    "security_user_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "result" VARCHAR(20) NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP NOT NULL,

    PRIMARY KEY ("id"),

    CHECK ("action" IN (
        'ENTRY'
    )),

    CHECK ("result" IN (
        'ALLOWED',
        'DENIED'
    )),

    CHECK ("reason" IN (
        'VALID_QR',
        'QR_EXPIRED',
        'QR_ALREADY_USED',
        'QR_REVOKED',
        'INVALID_QR',
        'NOT_VERIFIED'
    ))
);


-- Foreign Keys

ALTER TABLE "guardian_student"
ADD FOREIGN KEY ("student_id")
REFERENCES "students" ("id");

ALTER TABLE "guardian_student"
ADD FOREIGN KEY ("guardian_id")
REFERENCES "users" ("id");


ALTER TABLE "verification_requests"
ADD FOREIGN KEY ("guardian_student_id")
REFERENCES "guardian_student" ("id");


ALTER TABLE "qr_codes"
ADD FOREIGN KEY ("guardian_student_id")
REFERENCES "guardian_student" ("id");


ALTER TABLE "access_logs"
ADD FOREIGN KEY ("qr_code_id")
REFERENCES "qr_codes" ("id");

ALTER TABLE "access_logs"
ADD FOREIGN KEY ("security_user_id")
REFERENCES "users" ("id");