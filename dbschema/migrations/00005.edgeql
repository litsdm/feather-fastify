CREATE MIGRATION m1ky3jtndacjpywcryhk25lw4c3bkt3y4k5kmbsvmioa2rn4bzgzta
    ONTO m12ghc45httijnbbf7o6sen33fnrecqwvx3bce3hp4ngognbckcqaq
{
  ALTER TYPE default::File {
      CREATE LINK from -> default::User;
      CREATE MULTI LINK to -> default::User;
  };
};
