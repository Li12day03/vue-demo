// plopfile.js
export default function (plop) {
  // 我们来创建一个名为 "module" 的 plop 生成器
  plop.setGenerator("module", {
    // 描述这个生成器的作用
    description: "创建一个新的业务模块 (view + api)",

    // plop 在执行时，会向用户提出的一系列问题
    prompts: [
      {
        type: "input", // 提问类型：输入
        name: "name", // 存储答案的变量名
        message: "请输入模块的名称 (例如: User Manage / 用户管理)", // 提问的文字
        validate: value => {
          // 对答案进行校验
          if (/.+/.test(value)) {
            return true;
          }
          return "模块名称不能为空";
        },
      },
      {
        type: "input",
        name: "pathName", // 存储路径/组件名的变量
        message: "请输入模块的路径和组件名 (纯英文, 大驼峰, 例如: UserManage)",
        validate: value => {
          if (/.+/.test(value)) {
            return true;
          }
          return "路径和组件名不能为空";
        },
      },
    ],

    // 当问题回答完毕后，plop 要执行的一系列动作
    actions: [
      {
        type: "add", // 动作类型：添加文件
        path: "src/views/{{pathName}}/index.vue", // 文件创建路径和文件名，{{pathName}} 是上面的答案
        templateFile: "plop-templates/view.vue.hbs", // 使用哪个模板文件
      },
      {
        type: "add",
        path: "src/api/{{pathName}}.js",
        templateFile: "plop-templates/api.js.hbs",
      },
      () => "模块创建成功！", // 最后打印一句成功提示
    ],
  });
}
