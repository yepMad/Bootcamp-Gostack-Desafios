import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ name });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products.map(i => i.id);
    const existentProducts = await this.ormRepository.findByIds(productsIds);

    return existentProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsIds = products.map(i => i.id);
    const existentProducts = await this.ormRepository.findByIds(productsIds);

    const productsToSave = existentProducts.map(product => {
      const productQuantity = products.find(i => i.id === product.id)?.quantity;
      if (!productQuantity) {
        throw new Error('Product not found!');
      }

      const newProduct = product;
      newProduct.quantity = productQuantity;

      return newProduct;
    });

    const newProducts = await this.ormRepository.save(productsToSave);
    return newProducts;
  }
}

export default ProductsRepository;
