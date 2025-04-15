import { Telegraf, Markup } from 'telegraf';
import { InjectBot, Update } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { BOT_MESSAGES } from './telegram.messages';

@Update()
export class TelegramController {
  constructor(
    @InjectBot('customerBot') private readonly customerBot: Telegraf<any>,
    @InjectBot('referrerBot') private readonly referrerBot: Telegraf<any>,
    @InjectBot('trader1Bot') private readonly trader1Bot: Telegraf<any>,
    @InjectBot('trader2Bot') private readonly trader2Bot: Telegraf<any>,
    private readonly telegramService: TelegramService,
  ) {
    this.customerBot.start(this.processStart);
    this.customerBot.on('text', (ctx) => this.handleText(ctx));
    this.referrerBot.start(this.processStart);
    this.referrerBot.on('text', (ctx) => this.handleText(ctx));
    this.trader1Bot.start(this.processStart);
    this.trader1Bot.on('text', (ctx) => this.handleText(ctx));
    this.trader2Bot.start(this.processStart);
    this.trader2Bot.on('text', (ctx) => this.handleText(ctx));
  }

  processStart = async (ctx: any) => {
    console.log('prestart');

    const tgUserId: string = ctx?.update?.message?.from?.id;

    const tgUserName: string = ctx?.update?.message?.from?.username;

    // const tgUserId: string = ctx?.update?.message?.from?.id.toString();

    const res = await this.telegramService.getFirstResponse(
      tgUserId,
      tgUserName,
    );

    await this.handleReply(ctx, res, tgUserId);
  };

  handleText = async (ctx: any) => {
    const tgUserId: string = ctx?.update?.message?.from?.id;
    // const tgUserId: string = ctx?.update?.message?.from?.id.toString();
    const userName = ctx?.update?.message?.from?.first_name
      ? ctx?.update?.message?.from?.first_name
      : '' + ctx?.update?.message?.from?.last_name
        ? ctx?.update?.message?.from?.last_name
        : '';
    const tgUserName = ctx?.update?.message?.from?.username;
    const referralCode: string = ctx?.update?.message?.text;

    console.log(referralCode);

    const res = await this.telegramService.getResponse(
      tgUserId,
      userName,
      tgUserName,
      referralCode,
      ctx.botInfo.username,
    );

    await this.handleReply(ctx, res, tgUserId);
  };

  handleReply = async (ctx: any, res: string, tgUserId: string) => {
    if (!res.match(BOT_MESSAGES.REFERRALCODE_ACCEPTED)) await ctx.reply(res);
    else {
      const access_data = res.substring(
        BOT_MESSAGES.REFERRALCODE_ACCEPTED.length,
        res.length - 1,
      );
      let webAppUrl = '';
      if (ctx.telegram.token == process.env.TELEGRAM_CUSTOMER_TOKEN) {
        webAppUrl = `https://bobster.freeblock.site/?${access_data}`;
      } else if (ctx.telegram.token == process.env.TELEGRAM_REFERRER_TOKEN) {
        webAppUrl = `https://bobster-front-referer.freeblock.site/?${access_data}`;
      } else if (ctx.telegram.token == process.env.TELEGRAM_TRADER1_TOKEN) {
        webAppUrl = `https://bobster-front-traider.freeblock.site/?${access_data}`;
      } else {
        webAppUrl = `https://bobster-front-traider.freeblock.site/?${access_data}`;
      }

      await ctx.replyWithHTML(
        `Hey,   ${tgUserId}!   Welcome to BobSter! 🚀
        <b>BobSter</b> - where your achievements are rewarded! 💰`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('Launch', webAppUrl)],
          [Markup.button.url('Join community', 'https://t.me/')],
        ]),
      );
    }
  };
}
