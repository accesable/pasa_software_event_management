import { handleRpcException } from '@app/common/filters/handleException';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@app/common/types/event';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument, EventCategory } from 'apps/event-service/src/event-category/schemas/event-category.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventCategoryService {
    constructor(
        @InjectModel(EventCategory.name) private categoryModel: Model<CategoryDocument>
    ) { }

    async createCategory(request: CreateCategoryRequest) {
        try {
            const isExist = await this.categoryModel.findOne({ name: request.name });
            if (isExist) {
                throw new RpcException({
                    message: 'Category already exist',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            const res = await this.categoryModel.create(request);
            return { category: this.transformCategory(res)};
        } catch (error) {
            throw handleRpcException(error, 'Failed to create category');
        }
    }

    async getAllCategory() {
        try {
            const categories  = await this.categoryModel.find();
            const categoryResponses: Category[] = categories.map(category => this.transformCategory(category));

            const meta = {
                totalItems: categories.length,
                count: categories.length,
            }
        
              return { 
                categories: categoryResponses,
                meta: meta
               };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all category');
        }
    }

    async getCategoryById(id: string) {
        try {
            const res = await this.categoryModel.findById(id);
            return { category: this.transformCategory(res)};
        } catch (error) {
            throw handleRpcException(error, 'Failed to get category by id');
        }
    }

    async updateCategory(request: UpdateCategoryRequest) {
        try {
            const isExistName = await this.categoryModel.findOne({ name: request.name });
            if (isExistName) {
                throw new RpcException({
                    message: 'Category already exist',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            const category = await this.categoryModel.findByIdAndUpdate
            (request.id, request, { new: true });
            return { category: this.transformCategory(category) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to update category');
        }
    }

    async getCategoryByName(name: string) {
        try {
            const category = await this.categoryModel.findOne({ name });
            return { category: this.transformCategory(category) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get category by name');
        }
    }

    transformCategory(category: CategoryDocument) {
        try {
            const res: Category = {
                id: category.id,
                name: category.name,
                description: category.description
            }
            return res;
        } catch (error) {
            throw handleRpcException(error, 'Failed to transform category');
        }
    }
}
