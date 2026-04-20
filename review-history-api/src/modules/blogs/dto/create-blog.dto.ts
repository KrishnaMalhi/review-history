import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'How to Choose a Reliable Landlord in Karachi' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'how-to-choose-reliable-landlord-karachi' })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;

  @ApiPropertyOptional({ example: 'A quick practical guide for tenants and families.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ example: 'Long-form blog markdown/text content...' })
  @IsString()
  @MinLength(20)
  content!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blogs/landlord-guide.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
