CREATE MIGRATION m1b5leuuwhe3ltggn45rnar73vk5lqn6yg6hhg7owjieasb5azeaua
    ONTO m1isvxxttm4fdon54rwfg6ulmrho2ekmjn5fmz3l2h5rjnuxpchjjq
{
  ALTER TYPE default::User {
      ALTER PROPERTY email {
          RESET OPTIONALITY;
      };
  };
  ALTER TYPE default::User {
      ALTER PROPERTY isPro {
          SET default := false;
      };
  };
  ALTER TYPE default::User {
      ALTER PROPERTY password {
          RESET OPTIONALITY;
      };
  };
  ALTER TYPE default::User {
      ALTER PROPERTY username {
          RESET OPTIONALITY;
      };
  };
};
