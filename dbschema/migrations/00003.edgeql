CREATE MIGRATION m1mwjkb54vr3nmijasgjlifesbpxn54usw4p7lkesoea52sksqhjqa
    ONTO m1b5leuuwhe3ltggn45rnar73vk5lqn6yg6hhg7owjieasb5azeaua
{
  ALTER TYPE default::User {
      DROP PROPERTY remainingBytes;
  };
};
