import { Telegraf, Markup } from 'telegraf';
import { InjectBot, Update } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Update()
export class TelegramController {
  constructor(
    @InjectBot('customerBot') private readonly customerBot: Telegraf<any>,
    @InjectBot('referrerBot') private readonly referrerBot: Telegraf<any>,
    @InjectBot('trader1Bot') private readonly trader1Bot: Telegraf<any>,
    @InjectBot('trader2Bot') private readonly trader2Bot: Telegraf<any>,
    private readonly telegramService: TelegramService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    [this.customerBot, this.referrerBot, this.trader1Bot, this.trader2Bot]
    .forEach(bot => bot.start(this.processStart));
    // this.customerBot.start(this.processStart);
    // // this.customerBot.on('text', (ctx) => this.handleText(ctx));
    // this.referrerBot.start(this.processStart);
    // // this.referrerBot.on('text', (ctx) => this.handleText(ctx));
    // this.trader1Bot.start(this.processStart);
    // // this.trader1Bot.on('text', (ctx) => this.handleText(ctx));
    // this.trader2Bot.start(this.handleTrader2Start);

    // this.trader2Bot.start(this.processStart);
    // this.trader2Bot.on('text', (ctx) => this.handleText(ctx));
  }

  processStart = async (ctx: any) => {
    
    const from = ctx.from || ctx.update?.message?.from;
    const tgId = from.id.toString();
    const tgUserName = from.username;
    
    const token = ctx.telegram.token;
    const isCustomer = token === process.env.TELEGRAM_CUSTOMER_TOKEN;
    const isReferrer = token === process.env.TELEGRAM_REFERRER_TOKEN;
    const isTrader1 = token === process.env.TELEGRAM_TRADER1_TOKEN;
    const isTrader2 = token === process.env.TELEGRAM_TRADER2_TOKEN;

    let user = await this.usersService.findByTel_userId(tgId);
    if (!user && tgUserName) {
      user = await this.usersService.findByTel_userName(tgUserName);
      if (user && user.tgId !== tgId) {
        await this.usersService.update(user.id, { tgId });
      }
    }

    if (user) {
      const loginData = await this.authService.validateLogin({ tgId, tgUserName: user.tgUserName });
      if (!loginData) {
        return ctx.reply('❌ Authorization error, please contact your administrator.');
      }
      const { token: accessToken, refreshToken } = loginData;
      const params = `token=${accessToken}&refreshToken=${refreshToken}`;

      const baseUrl = isCustomer
      ? process.env.WEBAPP_URL_CUSTOMER!
      : isReferrer
        ? process.env.WEBAPP_URL_REFERRER!
        : isTrader1
          ? process.env.WEBAPP_URL_TRADER!
          : process.env.WEBAPP_URL_TRADER!;

    const url = `${baseUrl}?${params}`;
      
      return ctx.reply(
        '✅ Successful authorization, open the application:',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Open WebApp', url)],
        ]),
      );
    }

    if (isCustomer || isTrader1) {
      const loginUrl = isCustomer
        ? process.env.WEBAPP_URL_CUSTOMER!
        : process.env.WEBAPP_URL_TRADER!;
      return ctx.reply(
        '👋 Welcome! SignIn via our WebApp:',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🔑 Sign IN', loginUrl)],
        ]),
      );
    } else {
      return ctx.reply('❌ You are not registered. Please contact the administrator..');
    }
  };

  // handleText = async (ctx: any) => {
  //   const tgUserId: string = ctx?.update?.message?.from?.id;
  //   // const tgUserId: string = ctx?.update?.message?.from?.id.toString();
  //   const userName = ctx?.update?.message?.from?.first_name
  //     ? ctx?.update?.message?.from?.first_name
  //     : '' + ctx?.update?.message?.from?.last_name
  //       ? ctx?.update?.message?.from?.last_name
  //       : '';
  //   const tgUserName = ctx?.update?.message?.from?.username;
  //   const referralCode: string = ctx?.update?.message?.text;

  //   console.log(referralCode);

  //   const res = await this.telegramService.getResponse(
  //     tgUserId,
  //     userName,
  //     tgUserName,
  //     referralCode,
  //     ctx.botInfo.username,
  //   );

  //   await this.handleReply(ctx, res, tgUserId);
  // };

  // handleReply = async (ctx: any, res: string, tgUserId: string) => {
  //   if (!res.match(BOT_MESSAGES.REFERRALCODE_ACCEPTED)) await ctx.reply(res);
  //   else {
  //     const access_data = res.substring(
  //       BOT_MESSAGES.REFERRALCODE_ACCEPTED.length,
  //       res.length - 1,
  //     );
  //     let webAppUrl = '';
  //     if (ctx.telegram.token == process.env.TELEGRAM_CUSTOMER_TOKEN) {
  //       webAppUrl = `https://bobster.freeblock.site/?${access_data}`;
  //     } else if (ctx.telegram.token == process.env.TELEGRAM_REFERRER_TOKEN) {
  //       webAppUrl = `https://bobster-front-referer.freeblock.site/?${access_data}`;
  //     } else if (ctx.telegram.token == process.env.TELEGRAM_TRADER1_TOKEN) {
  //       webAppUrl = `https://bobster-front-traider.freeblock.site/?${access_data}`;
  //     } else {
  //       webAppUrl = `https://bobster-front-traider.freeblock.site/?${access_data}`;
  //     }

      // await ctx.replyWithHTML(
      //   ` Welcome to BobSter! 🚀
      //   <b>BobSter</b> - where your achievements are rewarded! 💰`,
      //   Markup.inlineKeyboard([
      //     [Markup.button.webApp('Launch', webAppUrl)],
      //     [Markup.button.url('Join community', 'https://t.me/')],
      //   ]),
      // );
  //   }
  }