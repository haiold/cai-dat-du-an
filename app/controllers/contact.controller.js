const { Contact } = require("../models");
const { BadRequestError, handle } = require("../helpers/errors");

exports.create = async (req, res, next) => {
  if (!req.body.name) {
    return next(new BadRequestError(400, "Name can not be empty"));
  }

  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    favorite: String(req.body.favorite).toLowerCase() === "true",
  });

  const [error, document] = await handle(contact.save());

  if (error) {
    return next(
      new BadRequestError(500, "An error occurred while creating the contact")
    );
  }
  return res.send(document);
};

exports.findAll = async (req, res, next) => {
  const condition = {};
  const name = req.query.name;
  console.log(name);
  if (name) {
    condition.name = { $regex: new RegExp(name), $option: "i" };
  }
  const [error, documents] = await handle(Contact.find(condition));
  if (error) {
    return next(
      new BadRequestError(500, "An error occurred while creating the contact")
    );
  }
  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  const condition = {
    _id: req.params.id,
  };
  const [error, document] = await handle(Contact.findOne(condition));
  if (error) {
    return next(
      new BadRequestError(
        500,
        `Error retrieving contact with id=${req.params.id}`
      )
    );
  }
  if (!document) {
    return next(new BadRequestError(404, "Contact not found"));
  }
  return res.send(document);
};

exports.update = async (req, res, next) => {
  if (!req.body) {
    return next(new BadRequestError(400, "Data to update can not b empty"));
  }
  const condition = {
    _id: req.params.id,
  };
  const [error, document] = await handle(
    Contact.findOneAndUpdate(condition, req.body, {
      new: true,
    })
  );
  if (error) {
    return next(
      new BadRequestError(
        500,
        `Error updating contact with id=${req.params.id}`
      )
    );
  }
  if (!document) {
    return next(new BadRequestError(404, "Contact not found"));
  }
  return res.send({ message: "Contact was updated successfully" });
};
exports.delete = async (req, res, next) => {
  const condition = {
    _id: req.params.id,
  };
  const [error, document] = await handle(Contact.findOneAndDelete(condition));
  if (error) {
    return next(
      new BadRequestError(
        500,
        `Could not delete contact with id=${req.params.id}`
      )
    );
  }

  if (!document) {
    return next(new BadRequestError(404, "Contact not found"));
  }
  return res.send({ message: "Contact was delete successfully" });
};

exports.findAllFavorite = async (req, res, next) => {
  const [error, documents] = await handle(
    Contact.find({
      favorite: true,
    })
  );
  if (error) {
    return next(
      new BadRequestError(
        500,
        "An error occured while retrieving favorite contacts"
      )
    );
  }
  return res.send(documents);
};

exports.deleteAll = async (req, res, next) => {
  const [error, data] = await handle(Contact.deleteMany({}));
  if (error) {
    return next(
      new BadRequestError(500, "An error occurred while removing all contacts")
    );
  }
  return res.send({
    message: `${data.deletedCount} contacts were deleted successfully`,
  });
};
