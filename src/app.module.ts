import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './mail/config/mail.config';
import fileConfig from './files/config/file.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { HeaderResolver } from 'nestjs-i18n';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';
import { TelegramModule } from './telegram/telegram.module';
import { CurrenciesModule } from './base/currencies/currencies.module';
import { PaymentMethodsModule } from './base/payment-methods/payment-methods.module';
import { OrdersModule } from './order/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CronJobModule } from './cron/cron-job.module';
import { FeeScheduleModule } from './base/feeSchedule/feeSchedules.module';
import { LanguagesModule } from './base/languages/languages.module';
import { AddressesModule } from './base/addresses/addresses.module';
import { NotificationsModule } from './notify/notifications.module';
import { PaymentModule } from './payment/payment.module';
import { TransactionModule } from './transactions/transaction.module';

// <database-block>
const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});
// </database-block>

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, mailConfig, fileConfig],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    SessionModule,
    MailModule,
    MailerModule,
    HomeModule,
    TelegramModule,
    CurrenciesModule,
    PaymentModule,
    PaymentMethodsModule,
    OrdersModule,
    ReviewsModule,
    CronJobModule,
    FeeScheduleModule,
    LanguagesModule,
    AddressesModule,
    NotificationsModule,
    TransactionModule,
  ],
})
export class AppModule {}
