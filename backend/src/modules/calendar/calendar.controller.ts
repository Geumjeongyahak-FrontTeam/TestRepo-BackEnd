import {
  Controller,
  Logger,
  Get,
  Post,
  Query,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ParseEnumPipe
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarExchangeService } from './calendar-exchange.service';
import { CalendarCancellationService } from './calendar-cancellation.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto, EventQueryPeriod } from './dto/event-query.dto';
import { ExchangeClassDto } from './dto/exchange-class.dto';
import { CancelClassDto } from './dto/cancellation-class.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(
    private readonly calendarService: CalendarService,
    private readonly calendarExchangeService: CalendarExchangeService,
    private readonly calendarCancellationService: CalendarCancellationService,
  ) {}

  @Post('events')
  @ApiOperation({ summary: '단일 수업 이벤트 생성' })
  @ApiResponse({ status: 201, description: '이벤트 생성 성공' })
  async createEvent(@Body() createEventDto: CreateEventDto) {
    this.logger.log(`Creating new event: ${JSON.stringify(createEventDto)}`);
    return this.calendarService.createEvent(createEventDto);
  }

  @Post('events/bulk')
  @ApiOperation({ summary: '여러 수업 이벤트 일괄 생성' })
  @ApiResponse({ status: 201, description: '이벤트 일괄 생성 성공' })
  async createBulkEvents(@Body() events: CreateEventDto[]) {
    this.logger.log(`Creating ${events.length} events in bulk`);
    return this.calendarService.createBulkEvents(events);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'ID로 단일 이벤트 조회' })
  @ApiResponse({ status: 200, description: '이벤트 조회 성공' })
  async getEvent(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching Event with id: ${id}`);
    return this.calendarService.getSingleEvent(id);
  }

  @Get('events-range')
  @ApiOperation({ summary: '기간에 따른 이벤트 목록 조회' })
  @ApiResponse({ status: 200, description: '이벤트 목록 반환' })
  async getEventsByDateRange(@Query('period', new ParseEnumPipe(EventQueryPeriod)) period: EventQueryPeriod) {
    const queryDto = new EventQueryDto();
    queryDto.period = period;
    this.logger.log(`Fetching Events with Period: ${queryDto.period}`);
    return this.calendarService.getEventsByPeriod(queryDto);
  }

  @Get('test-range')
  @ApiOperation({ summary: '기간 쿼리 테스트용 API' })
  testRange(@Query('period', new ParseEnumPipe(EventQueryPeriod)) period: EventQueryPeriod) {
    return { period };
  }

  @Get('events/detail')
  @ApiOperation({ summary: '이벤트 상세 정보 조회' })
  @ApiResponse({ status: 200, description: '이벤트 상세 반환' })
  async getSingleEventDetail(@Query('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching Event in detail for event id: ${id}`);
    return this.calendarService.getEventDetail(id);
  }

  @Put('events/:id')
  @ApiOperation({ summary: '이벤트 수정' })
  @ApiResponse({ status: 200, description: '이벤트 수정 완료' })
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    this.logger.log(`Updating event ${id}: ${JSON.stringify(updateEventDto)}`);
    return this.calendarService.updateEvent(id, updateEventDto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiResponse({ status: 200, description: '삭제 완료 메시지 반환' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting event ${id}`);
    await this.calendarService.deleteEvent(id);
    return { message: 'Event deleted successfully' };
  }

  @Post('exchange')
  @ApiOperation({ summary: '수업 교환 신청' })
  @ApiResponse({ status: 201, description: '교환 처리 성공' })
  async exchange(@Body() exchangeDto: ExchangeClassDto) {
    this.logger.log(
      `Exchanging teachers with data: ${JSON.stringify(exchangeDto)}`,
    );
    return this.calendarExchangeService.swapTeachers(exchangeDto);
  }

  @Post('cancel')
  @ApiOperation({ summary: '수업 취소 신청' })
  @ApiResponse({ status: 201, description: '취소 처리 성공' })
  async cancel(@Body() cancelDto: CancelClassDto) {
    this.logger.log(
      `Cancelling class with data: ${JSON.stringify(cancelDto)}`,
    );
    return this.calendarCancellationService.cancelClass(cancelDto);
  }
}
