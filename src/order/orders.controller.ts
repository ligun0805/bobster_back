import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../roles/roles.enum';
import {
  OrderIdDto,
  PaidOrderIdDto,
  TransferFileDto,
} from './dto/confirm-payment-dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderStatusEnum } from './order.enum';
import { OrdersService } from './orders.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream } from 'fs';
import path from 'path';
import { Response } from 'express';

@ApiTags('Order')
@Controller({
  path: 'orders',
  version: '1',
})
// @UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  // @Roles(RoleEnum.customer)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('/:customerId')
  async findOrdersByCustomer(@Param('customerId') customerId: number) {
    return this.orderService.findOrdersByCustomer(customerId);
  }

  @Get('/transfers/:filename')
  @UseGuards(AuthGuard('jwt'))
  getTransfersFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = createReadStream(
      path.join(__dirname, '..', '..', 'uploads', 'transfers', filename),
    );
    file.pipe(res);
  }

  @Get('/receipts/:filename')
  @UseGuards(AuthGuard('jwt'))
  getReceiptsFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = createReadStream(
      path.join(__dirname, '..', '..', 'uploads', 'receipts', filename),
    );
    file.pipe(res);
  }

  @Patch('byOrderId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findOrderByOrderId(
    @Request() request: any,
    @Body() findOrder: OrderIdDto,
  ) {
    const user = request.user;
    const order = await this.orderService.findOrderByOrderId(
      findOrder.orderId,
      user,
    );
    return { ...order, receiptFilePath: order.receiptFilePath || null };
  }

  @Patch('pick/:orderId/:traderPaymentMethodId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async pickOrder(
    @Request() request: any,
    @Param('orderId') orderId: string,
    @Param('traderPaymentMethodId') traderPaymentMethodId: number,
  ) {
    const user = request.user;
    return this.orderService.pickOrder(user.id, orderId, traderPaymentMethodId);
  }

  @Patch('dispute')
  // @Roles(RoleEnum.customer)
  async disputeOrder(@Body() dispute: OrderIdDto) {
    return this.orderService.disputeOrder(dispute.orderId);
  }

  @Patch('customerSent')
  // @Roles(RoleEnum.customer)
  async customerSent(@Body() customerSent: OrderIdDto) {
    return this.orderService.customerSent(customerSent.orderId);
  }

  @Patch('transferFileUpload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          example: '43252346537464325',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/transfers',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new UnprocessableEntityException('Invalid file format'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  transferFileUpload(
    @UploadedFile() file: Express.Multer.File,
    // @Request() request,
    @Body() body: TransferFileDto,
  ) {
    let filePath = '';
    try {
      filePath = file.filename;
    } catch (error) {
      console.error(`Error while upload transfer_file ${error}`);
    }
    if (filePath === '') {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    return this.orderService.transferFileUpload(
      body.orderId,
      `/transfers/${filePath}`,
    );
  }

  @Patch('traderReceived')
  // @Roles(RoleEnum.trader)
  async traderReceived(@Body() traderReceived: OrderIdDto) {
    return this.orderService.traderReceived(traderReceived.orderId);
  }

  @Patch('traderPaid')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['orderId'],
      properties: {
        orderId: {
          type: 'string',
          example: '43252346537464325',
        },
        receiptFilePath: {
          example: '/uploads/receipts/receipt.pdf',
          type: 'string',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/receipts',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new UnprocessableEntityException('Invalid file format'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async traderPaid(
    @UploadedFile() file: Express.Multer.File,
    @Body() traderReceived: PaidOrderIdDto,
  ) {
    let filePath = '';
    try {
      filePath = file.filename;
    } catch (error) {
      console.error(`Error while upload receipt_file ${error}`);
    }
    const receiptFilePath = filePath
      ? `receipts/${file.filename}`
      : traderReceived.receiptFilePath;
    return this.orderService.traderPaid(
      traderReceived.orderId,
      receiptFilePath,
    );
  }

  @Patch('customerConfirm')
  // @Roles(RoleEnum.customer)
  async customerConfirmed(@Body() customerConfirmed: OrderIdDto) {
    return this.orderService.customerConfirmed(customerConfirmed.orderId);
  }

  @Patch('trader2Participated/:trader2Id/:orderId')
  // @Roles(RoleEnum.trader2)
  async trader2Participated(
    @Param('traderId') trader2Id: number,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.trader2Participated(trader2Id, orderId);
  }

  @Patch('cancelOrder')
  // @Roles(RoleEnum.customer)
  async cancelOrder(@Body() cancelOrder: OrderIdDto) {
    return this.orderService.cancelOrder(cancelOrder.orderId);
  }

  @Get()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: QueryOrderDto) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    console.log('findAll', query);
    return this.orderService.findManyWithPagination({
      filterOptions: {
        statuses: query.statuses,
        orderTypes: query.orderTypes,
        isCash: query.isCash,
      },
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Patch('byUser')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findAllByUser(@Request() request, @Query() query: QueryOrderDto) {
    const userId = request.user.id;
    let userRole = request.user.role;
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    userRole = userRole.id;
    const keyword = query?.keyword ?? '';
    return this.orderService.findManyWithPaginationByUser({
      userId,
      userRole,
      filterOptions: {
        statuses: query.statuses,
        orderTypes: query.orderTypes,
        isCash: query.isCash,
      },
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }
  @Get(
    'referredOrders/:customerReferralCode/:traderReferralCode/:trader2ReferralCode',
  )
  // @Roles(RoleEnum.customer)
  async findReferredOrdersByReferer(
    @Param('customerReferralCode') customerReferralCode: string,
    @Param('traderReferralCode') traderReferralCode: string,
    @Param('trader2ReferralCode') trader2ReferralCode: string,
  ) {
    return this.orderService.findReferredOrdersByReferer(
      customerReferralCode,
      traderReferralCode,
      trader2ReferralCode,
    );
  }

  @Patch('cancelView')
  async cancelView(@Body() cancelView: OrderIdDto) {
    return this.orderService.cancelView(cancelView.orderId);
  }

  @Patch('resolveDispute')
  async resolveDispute(@Body() resolveDispute: OrderIdDto) {
    return this.orderService.resolveDispute(resolveDispute.orderId);
  }

  @Patch('refundToTraderAll')
  async refundToTrader(@Body() order: OrderIdDto) {
    return this.orderService.refundToTrader(order.orderId);
  }

  @Patch('refundToTraderWithoutFee')
  async refundToTraderWithoutFee(@Body() order: OrderIdDto) {
    return this.orderService.refundToTraderWithoutFee(order.orderId);
  }

  @Patch('notRefundToTrader')
  async notRefundToTrader(@Body() order: OrderIdDto) {
    return this.orderService.notRefundToTrader(order.orderId);
  }

  @Patch('refundToTraderOnlyFee')
  async refundToTraderOnlyFee(@Body() order: OrderIdDto) {
    return this.orderService.refundToTraderOnlyFee(order.orderId);
  }

  @Get('trader/history')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getTraderHistory(@Request() request, @Query() query: QueryOrderDto) {
    const userId = request.user.id;

    // Verify user is a trader
    if (
      request.user.role.id !== RoleEnum.trader &&
      request.user.role.id !== RoleEnum.trader2
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Only traders can access trader history',
        },
      });
    }

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';

    return this.orderService.findManyWithPaginationByUser({
      userId,
      userRole: request.user.role.id,
      filterOptions: {
        statuses: [
          OrderStatusEnum.COMPLETED,
          OrderStatusEnum.CANCELED,
          OrderStatusEnum.ORDER_FINISHED,
          OrderStatusEnum.DISPUTE,
          OrderStatusEnum.TRADER2_PARTICIPATED,
          OrderStatusEnum.TRADER_PAID,
          OrderStatusEnum.TRADER_RECEIVED,
          OrderStatusEnum.CUSTOMER_SENT,
          OrderStatusEnum.TRADER1_DEPOSIT,
        ],
        orderTypes: query.orderTypes,
        isCash: query.isCash,
      },
      sortOptions: query?.sort,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }
}
