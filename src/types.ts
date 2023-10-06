export type Prompts = Required<
    Omit<
        {
            [x in keyof CreateOptions]: CreateOptions[x] | symbol;
        } & { pkgMgr: string | symbol; git: boolean | symbol },
        'name'
    >
>;

export interface CreateOptions {
    name?: string;
    type: string;
    lang: 'ts' | 'js';
    lint?: boolean;
    hooks?: boolean;
    commitLint?: boolean;
    // moduleType?: 'module' | 'commonjs';
}
