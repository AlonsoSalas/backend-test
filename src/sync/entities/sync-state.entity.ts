import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sync_state')
export class SyncState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nextSyncUrl: string;

  @CreateDateColumn()
  updatedAt: Date;
}
