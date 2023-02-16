import { MigrationInterface, QueryRunner } from "typeorm";

export class initTables1676541064576 implements MigrationInterface {
    name = 'initTables1676541064576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(256) NOT NULL, CONSTRAINT "UQ___role___name" UNIQUE ("name"), CONSTRAINT "PK___role___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'BLOCKED', 'NOT_ACTIVATED')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying(256) NOT NULL, "status" "public"."user_status_enum" NOT NULL DEFAULT 'NOT_ACTIVATED', "password" character varying(256) NOT NULL, "salt" character varying(256) NOT NULL, "last_logon_at" TIMESTAMP WITH TIME ZONE, "blocked_at" TIMESTAMP WITH TIME ZONE, "activated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ___user___email" UNIQUE ("email"), CONSTRAINT "PK___user___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___user___status" ON "user" ("status") `);
        await queryRunner.query(`CREATE TABLE "department" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(256) NOT NULL, CONSTRAINT "UQ___department___name" UNIQUE ("name"), CONSTRAINT "PK___department___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."session_status_enum" AS ENUM('CREATED', 'ABANDONED', 'ACTIVE', 'EXPIRED', 'BLOCKED')`);
        await queryRunner.query(`CREATE TABLE "session" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "status" "public"."session_status_enum" NOT NULL DEFAULT 'CREATED', "data" jsonb NOT NULL DEFAULT '{}', "expired_at" TIMESTAMP WITH TIME ZONE NOT NULL, "last_activity_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK___session___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___session___status" ON "session" ("status") `);
        await queryRunner.query(`CREATE TABLE "schedule" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "start_date" date NOT NULL, "duration_in_hours" double precision NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK___schedule___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___schedule___start_date" ON "schedule" ("start_date") `);
        await queryRunner.query(`CREATE TYPE "public"."audit_user_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')`);
        await queryRunner.query(`CREATE TABLE "audit_user" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "action" "public"."audit_user_action_enum" NOT NULL, "data" jsonb DEFAULT '{}', "subject_id" uuid, "target_id" uuid, CONSTRAINT "PK___audit_user___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___audit_user___action" ON "audit_user" ("action") `);
        await queryRunner.query(`CREATE TYPE "public"."audit_schedule_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')`);
        await queryRunner.query(`CREATE TABLE "audit_schedule" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "action" "public"."audit_schedule_action_enum" NOT NULL, "data" jsonb DEFAULT '{}', "subject_id" uuid, "target_id" uuid, CONSTRAINT "PK___audit_schedule___id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___audit_schedule___action" ON "audit_schedule" ("action") `);
        await queryRunner.query(`CREATE TABLE "users__roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK___users__roles___user_id__role_id" PRIMARY KEY ("user_id", "role_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___users__roles___user_id" ON "users__roles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX___users__roles___role_id" ON "users__roles" ("role_id") `);
        await queryRunner.query(`CREATE TABLE "users__departments" ("user_id" uuid NOT NULL, "department_id" uuid NOT NULL, CONSTRAINT "PK___users__departments___user_id__department_id" PRIMARY KEY ("user_id", "department_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX___users__departments___user_id" ON "users__departments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX___users__departments___department_id" ON "users__departments" ("department_id") `);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK___session___user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK___schedule___user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_user" ADD CONSTRAINT "FK___audit_user___subject_id" FOREIGN KEY ("subject_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "audit_user" ADD CONSTRAINT "FK___audit_user___target_id" FOREIGN KEY ("target_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "audit_schedule" ADD CONSTRAINT "FK___audit_schedule___subject_id" FOREIGN KEY ("subject_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "audit_schedule" ADD CONSTRAINT "FK___audit_schedule___target_id" FOREIGN KEY ("target_id") REFERENCES "schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users__roles" ADD CONSTRAINT "FK___users__roles___user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users__roles" ADD CONSTRAINT "FK___users__roles___role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users__departments" ADD CONSTRAINT "FK___users__departments___user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users__departments" ADD CONSTRAINT "FK___users__departments___department_id" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users__departments" DROP CONSTRAINT "FK___users__departments___department_id"`);
        await queryRunner.query(`ALTER TABLE "users__departments" DROP CONSTRAINT "FK___users__departments___user_id"`);
        await queryRunner.query(`ALTER TABLE "users__roles" DROP CONSTRAINT "FK___users__roles___role_id"`);
        await queryRunner.query(`ALTER TABLE "users__roles" DROP CONSTRAINT "FK___users__roles___user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_schedule" DROP CONSTRAINT "FK___audit_schedule___target_id"`);
        await queryRunner.query(`ALTER TABLE "audit_schedule" DROP CONSTRAINT "FK___audit_schedule___subject_id"`);
        await queryRunner.query(`ALTER TABLE "audit_user" DROP CONSTRAINT "FK___audit_user___target_id"`);
        await queryRunner.query(`ALTER TABLE "audit_user" DROP CONSTRAINT "FK___audit_user___subject_id"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK___schedule___user_id"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK___session___user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___users__departments___department_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___users__departments___user_id"`);
        await queryRunner.query(`DROP TABLE "users__departments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___users__roles___role_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___users__roles___user_id"`);
        await queryRunner.query(`DROP TABLE "users__roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___audit_schedule___action"`);
        await queryRunner.query(`DROP TABLE "audit_schedule"`);
        await queryRunner.query(`DROP TYPE "public"."audit_schedule_action_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___audit_user___action"`);
        await queryRunner.query(`DROP TABLE "audit_user"`);
        await queryRunner.query(`DROP TYPE "public"."audit_user_action_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___schedule___start_date"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___session___status"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TYPE "public"."session_status_enum"`);
        await queryRunner.query(`DROP TABLE "department"`);
        await queryRunner.query(`DROP INDEX "public"."IDX___user___status"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
