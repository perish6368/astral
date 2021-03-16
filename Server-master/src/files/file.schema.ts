import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class File extends Document {
  /**
   * The file's information.
   */
  @Prop()
  file: {
    name: string;
    originalName: string;
    extension: string;
    date: string;
  }

  /**
   * The display information of the file, embed or not.
   */
  @Prop()
  display: {
    type: string;
    embed: {
      title: string;
      text: string;
      color: string;
    }
  }

  /**
   * The user who uploaded the file.
   */
  @Prop()
  user: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
