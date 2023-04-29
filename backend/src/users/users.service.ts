import crypto from 'node:crypto';
import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { ICreateUser } from '../../../schema/user';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Salt the plaintext password and generates hash digest
   *
   * @param password Plaintext password
   * @param salt Salt string generated with UsersService.#generateSalt
   * @returns sha-512 digest
   */
  saltPassword(password: string, salt: string): string {
    return crypto
      .createHash('sha512')
      .update(password + salt)
      .digest('hex');
  }

  /**
   * Generates salt string for user signup
   *
   * @returns 32byte hex string
   */
  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a user document and returns it
   *
   * @param createOpts ICreateUser
   * @returns Created user
   */
  async create(createOpts: ICreateUser): Promise<User> {
    const { username, password } = createOpts;

    const document = await this.findOne({ username });

    if (document) {
      throw new BadRequestException('User already exists');
    }

    const salt = this.generateSalt();
    const saltedPassword = this.saltPassword(password, salt);

    const createdUser = new this.userModel({
      username,
      saltedPassword,
      salt,
    });

    const savedUser = await createdUser.save();

    return savedUser;
  }

  /**
   * Find a single user document. If there are more than an one user,
   * return the first item.
   *
   * @param findOpts Find options
   * @returns User
   */
  async findOne(findOpts: Partial<User>): Promise<User> {
    return await this.userModel.findOne(findOpts);
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }
}
