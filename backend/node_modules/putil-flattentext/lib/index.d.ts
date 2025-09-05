declare module "putil-flattentext" {

    function flattenText(input: string, options?: {
        indent?: number,
        noWrap?: boolean
    });

    export = flattenText;

}
