exports.up = (pgm) => {
  // pgm.renameColumn("users", "createdAt", "created_at");
  // pgm.renameColumn("users", "updatedAt", "updated_at");
  pgm.addColumn("users", {
    features: {
      type: "varchar[]",
      notNull: true,
      default: "{}",
    },
  });
};

exports.down = false;
