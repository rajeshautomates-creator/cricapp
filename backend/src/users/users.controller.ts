import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangeRoleDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        return this.usersService.findAll(pageNum, limitNum);
    }

    @Get('stats')
    async getStats(@Req() req) {
        return this.usersService.getStats(req.user.userId, req.user.role);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req) {
        // Admins can only update themselves
        if (req.user.role === UserRole.ADMIN && id !== req.user.userId) {
            throw new Error('Admin users can only update their own profile');
        }
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string, @Req() req) {
        return this.usersService.remove(id, req.user.userId);
    }

    @Patch(':id/role')
    @Roles(UserRole.SUPER_ADMIN)
    async changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
        return this.usersService.changeRole(id, dto);
    }
}
