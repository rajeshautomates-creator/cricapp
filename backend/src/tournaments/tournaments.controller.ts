import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentsController {
    constructor(private tournamentsService: TournamentsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async create(@Body() dto: CreateTournamentDto, @Req() req) {
        return this.tournamentsService.create(dto, req.user.userId);
    }

    @Get()
    async findAll(@Req() req) {
        return this.tournamentsService.findAll(req.user.userId, req.user.role);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tournamentsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateTournamentDto, @Req() req) {
        return this.tournamentsService.update(id, dto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string, @Req() req) {
        return this.tournamentsService.remove(id, req.user.userId, req.user.role);
    }
}
