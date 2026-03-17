import { 
    Model, 
    Table, 
    Column, 
    DataType, 
    AutoIncrement, 
    PrimaryKey 
} from 'sequelize-typescript';

@Table({
    tableName: 'sessions',
    timestamps: false,
})

export class Session extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    token!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    })
    expiresAt!: Date;
}