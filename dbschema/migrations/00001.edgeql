CREATE MIGRATION m1isvxxttm4fdon54rwfg6ulmrho2ekmjn5fmz3l2h5rjnuxpchjjq
    ONTO initial
{
  CREATE TYPE default::User {
      CREATE PROPERTY createdAt -> std::str;
      CREATE PROPERTY discriminator -> std::str;
      CREATE REQUIRED PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY expoToken -> std::str;
      CREATE PROPERTY isPro -> std::bool;
      CREATE PROPERTY lastConnection -> std::str;
      CREATE REQUIRED PROPERTY password -> std::str;
      CREATE PROPERTY placeholderColor -> std::str;
      CREATE PROPERTY profilePic -> std::str;
      CREATE PROPERTY recentlySent -> array<std::str>;
      CREATE PROPERTY remainingBytes -> std::int64 {
          SET default := 2147483648;
      };
      CREATE PROPERTY remainingTransfers -> std::int16 {
          SET default := 3;
      };
      CREATE PROPERTY role -> std::str {
          SET default := 'user';
      };
      CREATE PROPERTY tag -> std::str;
      CREATE PROPERTY updatedAt -> std::str;
      CREATE REQUIRED PROPERTY username -> std::str;
  };
};
