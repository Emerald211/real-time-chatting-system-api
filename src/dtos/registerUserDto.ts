import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import {Role} from '@prisma/client'

export class RegisterUserDto {
	@IsNotEmpty()
	username!: string;

	@IsNotEmpty()
	@MinLength(6)
	password!: string;

	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsEnum(Role)
	role!: Role;
}
