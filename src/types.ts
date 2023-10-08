export type Symbolize<T extends object> = {
    [x in keyof T]: T[x] | symbol;
};

export type Prompts = Required<
    Omit<Symbolize<CreateOptions>, 'name'> & {
        pkgMgr: string | symbol;
        git: boolean | symbol;
    }
>;

export interface CreateOptions {
    name?: string;
    type: string;
    lang: 'ts' | 'js';
    lint?: boolean;
    hooks?: boolean;
    commitLint?: boolean;
    moduleType?: 'module' | 'commonjs';
}
