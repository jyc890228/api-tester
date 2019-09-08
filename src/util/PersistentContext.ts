import fs from 'fs';

abstract class PersistentContext {

    abstract save(key: string, value: any): void;

    abstract load(key: string): any;
}

class SessionPersistentContext extends PersistentContext {

    save(key: string, value: any): void {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    load(key: string): any {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
}


class FileSystemPersistentContext extends PersistentContext {

    save(key: string, value: any): void {
        //TODO
    }

    load(key: string): any {
        //TODO
        throw Error()
    }
}

const persistentContext: PersistentContext = Object.keys(fs).length ? new FileSystemPersistentContext() : new SessionPersistentContext();
export default persistentContext;