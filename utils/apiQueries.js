class APIQueries {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() { 
    const keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryString };

    // Removing unwanted properties
    const removeKeys = ["keyword", "page", "limit", "startDate", "endDate"];
    removeKeys.forEach((key) => delete queryCopy[key]);

    // Filter for price range
    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  searchByDateRange() {
    const startDate = this.queryString.startDate
      ? new Date(this.queryString.startDate)
      : new Date("2023-01-01");
    const endDate = this.queryString.endDate
      ? new Date(this.queryString.endDate)
      : new Date();

    this.query = this.query.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    return this;
  }

  paginate(resultsPerPage) {
    const currentPage = Number(this.queryString.page) || 1;
    const skip = (currentPage - 1) * resultsPerPage;

    this.query = this.query.skip(skip).limit(resultsPerPage);
    return this;
  }
}

export default APIQueries;

// ************* How to use ***************** 
// const queries = new APIQueries(MyModel.find(), req.query)
//   .search()
//   .filter()
//   .searchByDateRange()
//   .paginate(10);

// const results = await features.query;

 
// *************** Example frontend query ***********
// GET /api/v1/products?startDate=2022-01-01T00:00:00.000Z&endDate=2022-01-31T23:59:59.999Z

