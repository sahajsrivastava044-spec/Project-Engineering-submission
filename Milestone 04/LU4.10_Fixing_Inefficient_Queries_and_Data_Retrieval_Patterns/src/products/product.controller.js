import prisma from "../config/prisma.js";

const MAX_LIMIT = 100;

const ALLOWED_SORT_FIELDS = ["price", "createdAt", "name"];
const ALLOWED_FIELDS = ["id", "name", "price", "description", "createdAt"];

export async function listProducts(req, res) {
  try {
    let { page = 1, limit = 10, sortBy = "createdAt", order = "desc", fields } = req.query;

    // 🔹 Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // 🔹 Validate page & limit
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page value" });
    }

    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: "Invalid limit value" });
    }

    // 🔹 Enforce MAX_LIMIT
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    // 🔹 Validate sortBy
    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
      return res.status(400).json({ error: `Invalid sort field: ${sortBy}` });
    }

    // 🔹 Validate order
    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ error: "Order must be 'asc' or 'desc'" });
    }

    // 🔹 Field Selection (Whitelist)
    let select = undefined;

    if (fields !== undefined) {
      if (fields.trim() === "") {
        return res.status(400).json({ error: "Fields cannot be empty" });
      }

      const requestedFields = fields.split(",");
      select = {};

      for (let field of requestedFields) {
        if (!ALLOWED_FIELDS.includes(field)) {
          return res.status(400).json({
            error: `Invalid field requested: ${field}`
          });
        }
        select[field] = true;
      }
    }

    const skip = (page - 1) * limit;

    // 🔹 Query DB (optimized)
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order
        },
        ...(select && { select })
      }),
      prisma.product.count()
    ]);

    // 🔹 Response with meta
    res.json({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: products
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getProduct(req, res) {
  try {
    const id = parseInt(req.params.id);

    // 🔹 Validate ID
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}