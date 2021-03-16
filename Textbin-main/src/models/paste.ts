import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({ options: { allowMixed: 0 } })
export class Paste {
    /**
     * The user who requested the paste.
     */
    @prop()
    info: {
        username: string;
        date: string;
        id: string;
    }

    /**
     * The paste information.
     */
    @prop()
    paste: {
        title: string;
        data: string;
    }
}

export default getModelForClass(Paste);
