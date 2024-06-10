const ImgModel = require("../modelsv2/model.imgproduct");
const VideoModel = require("../modelsv2/model.productvideo");
const ProductModel = require("../modelsv2/model.product");
const unorm = require('unorm');
exports.getAllProduct = async (req, res) => {
    try {
        let product = await ProductModel.productModel.find();
        await Promise.all(product.map(async item => {
            if (item.quantity === "0" && item.status !== "out of stock") {
                let product = await ProductModel.productModel.findById(item._id);
                product.status = "out of stock";
                await product.save();
            }
        }));
        let productData = await ProductModel.productModel.find({status: "stocking"});
        return res.send({
            message: "get product success",
            product: productData,
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
};
exports.getProductByCategoryId = async (req, res) => {
    let categoryId = req.body.categoryId;
    if (categoryId == null) {
        return res.send({message: "category id is required", code: 0});
    }
    try {
        let product = await ProductModel.productModel.find({category_id: categoryId});
        return res.send({
            message: "get product success",
            product: product,
            code: 1,
        });
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
};
exports.getDetailProduct = async (req, res) => {
    let data = [];
    let productId = req.body.productId;
    if (productId === null) {
        return res.send({message: "product id is required", code: 0});
    }
    try {
        let product = await ProductModel.productModel.findById(productId);
        let img = await ImgModel.productImgModel.find({product_id: product._id});
        let video = await VideoModel.productVideoModel.find({
            product_id: product._id,
        });
        data.push({product: product, img: img, video: video});
        return res.send({message: "get detail success", data: data, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
};

exports.getRunOutProducts = async (req, res) => {
  let topNumber = req.body.topNumber;
  if (topNumber === null) {
    return res.send({ message: "topNumber is required", code: 0 });
  }
  try {
    let products = await ProductModel.productModel.find();
    let productsRunOut = getProductsInRange(products);
    const ProductsRunOut = getTopProducts(topNumber, productsRunOut);
    return res.send({ message: "get product is running out success", data: ProductsRunOut, code: 1 });
  }catch (e) {
    console.log(e.message);
    return res.send({ message: e.message.toString(), code: 0 });
  }
}

exports.getHotSellProducts = async (req, res) => {
  let topNumber = req.body.topNumber;
  if (topNumber === null) {
    return res.send({ message: "topNumber is required", code: 0 });
  }
  try {
    let products = await ProductModel.productModel.find();
    let productsHotSale = getProductsInRangeSale(products)
    const ProductsRunOut = getTopSaleProducts(topNumber, productsHotSale);
    return res.send({ message: "get product is running out success", data: ProductsRunOut, code: 1 });
  }catch (e) {
    console.log(e.message);
    return res.send({ message: e.message.toString(), code: 0 });
  }
}
exports.searchProductByName = async (req, res) => {
    let txtSearch = req.body.txtSearch;
    if (txtSearch === null) {
        return res.send({message: "text search is required", code: 0});
    }
    try {
        let product = await ProductModel.productModel.find({status: "stocking"});
        const filteredProducts = searchProductsByName(txtSearch, product);
        return res.send({message: "get product search success", product: filteredProducts, code: 1});
    } catch (e) {
        console.log(e.message);
        return res.send({message: e.message.toString(), code: 0});
    }
}

function getTopProducts(number, products) {
    const sortedProducts = sortProductsByQuantity(products);
    return sortedProducts.slice(0, number);
}

function getTopSaleProducts(number, products) {
    const sortedProducts = sortProductsBySold(products);
    return sortedProducts.slice(0, number);
}

function sortProductsByQuantity(products) {
    return products.sort((a, b) => a.quantity - b.quantity);
}

function sortProductsBySold(products) {
    return products.sort((a, b) => b.sold - a.sold);
}

function getProductsInRange(products) {
  let limit =
  products.reduce((max, product) => (Number(product.quantity) > max ? Number(product.quantity) : max), -Infinity);
  return products.filter(product => Number(product.quantity) >= 0 && Number(product.quantity) <= Number(limit));
}
function getProductsInRangeSale(products) {
  let limit =
  products.reduce((max, product) => (Number(product.sold) > max ? Number(product.sold) : max), -Infinity);
  return products.filter(product => Number(product.sold) >= 1 && Number(product.sold) <= Number(limit));
}

function searchProductsByName(query, products) {
    const normalizedQuery = query.toLowerCase();

    return products.filter(product => {
        const normalizedProductName = product.name.toLowerCase();
        return normalizedProductName.includes(normalizedQuery);
    });
}

