import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  /**
   * The user's main information, username, password, etc.
   */
  @Prop()
  user: {
    username: string | null;
    password?: string | null;
    discordId: string | null;
    discordAvatar: string | null;
    invite: string | null;
    key: string | null;
  }

  /**
   * The user's stats, the number of images they uploaded, their invites, etc.
   */
  @Prop()
  stats: {
    uploads: number | null;
    invites: number | null;
    invitedBy: string | null;
    createdInvites: string[] | null;
    invitedUsers: string[] | null;
    registrationDate: string | null;
  }

  /**
   * The user's settings, their domain and their preferences.
   */
  @Prop()
  settings: {
    domain: { name: string | null, subdomain: string | null };
    showLink: boolean | null;
    fakeLink: {
      enabled: boolean | null;
      link: string | null;
    },
    embed: {
      enabled: boolean | null;
      color: string | null;
      title: string | null;
      text: string | null;
    },
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
