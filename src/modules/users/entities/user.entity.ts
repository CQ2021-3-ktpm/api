import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role, Gender, Status } from '@prisma/client'; 

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    unique: true,
  })
  phone_number: string;

  @Column()
  password_hash: string;

  @Column({
    nullable: true,
  })
  avatar_url: string;

  @Column({
    nullable: true,
    type: 'timestamp',
  })
  birthdate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
