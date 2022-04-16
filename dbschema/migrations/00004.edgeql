CREATE MIGRATION m12ghc45httijnbbf7o6sen33fnrecqwvx3bce3hp4ngognbckcqaq
    ONTO m1mwjkb54vr3nmijasgjlifesbpxn54usw4p7lkesoea52sksqhjqa
{
  CREATE TYPE default::File {
      CREATE PROPERTY createdAt -> std::str;
      CREATE PROPERTY expiresAt -> std::str;
      CREATE PROPERTY fileType -> std::str;
      CREATE PROPERTY hostFilename -> std::str;
      CREATE REQUIRED PROPERTY name -> std::str;
      CREATE PROPERTY remainingExpiryModifications -> std::int16 {
          SET default := 2;
      };
      CREATE PROPERTY senderDevice -> std::str;
      CREATE REQUIRED PROPERTY size -> std::int64;
      CREATE PROPERTY updatedAt -> std::str;
      CREATE PROPERTY url -> std::str;
  };
};
