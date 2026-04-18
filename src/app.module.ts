import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Config must load first - everything depends on it
    ConfigModule.forRoot({
      isGlobal: true, // no need to import in every module
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        // Important: autoLoadEntities = true means TypeOrm discovers
        // entities registered via TypeOrmModule.forFeatture() automatically
        autoLoadEntities: true,
        // synchronize: true is only for development
        // In production, we will use migrations
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
  ],
})
export class AppModule {}
