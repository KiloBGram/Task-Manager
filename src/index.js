import Backbone from 'backbone'
import _ from 'underscore';
import $ from 'jquery';
import './styles/main.scss';
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
function array_move(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
};
const Task = Backbone.Model.extend({
    initialize: function(){},
    defaults: function(){
      return{
        title: 'MyTask',
        done: false
      }
    },
    toggleChecked: function(){
      this.set({done:!this.get('done')});
    }
});
const TaskList = Backbone.Collection.extend({
  comparator: function(){return 0}
});
const tasks = new TaskList();
const TaskView = Backbone.View.extend({
  className:'task',
  model: new Task(),
  template: _.template($("#template").html()),
  events: {
    'click .task_edit-button': 'edit',
    'click .task_save-button': 'save',
    'click .task_checkbox': 'check',
    'click .task_delete-button': 'delete',
    'keypress .task_text-edit-input': 'keypress',
    'click .order-left': 'moveup',
    'click .order-right': 'movedown'
  },
  render: function(){
    this.$el.html(this.template({taskText:this.model.attributes.title, checked:this.model.attributes.done ? 'checked':''}));
    if(this.model.attributes.done){
      this.$el.find('.task_text-container').css({'text-decoration':'line-through', 'color':'#c1c1c1'});
    }else{
      this.$el.find('.task_text-container').css({'text-decoration':'none', 'color': 'black'});
    }
    return this;
  },
  edit: function(event){
    this.$('.task_edit-button').hide();
    this.$('.task_save-button').show();
    this.$('.task_text-container').html(`<input type="text" class="task_text-edit-input" value="${this.$('.task_text-container').html().trim()}"/>`);
    let length = this.$('.task_text-edit-input').val().length;
    this.$('.task_text-edit-input').focus();
    this.$('.task_text-edit-input')[0].setSelectionRange(0, length);
  },
  save: function(event){
    if($('.task_text-edit-input').val().trim()!==''){
      this.$('.task_save-button').hide();
      this.$('.task_edit-button').show();
      this.model.set({title: $('.task_text-edit-input').val()});
      this.$('.task_text-container').html($('.task_text-edit-input').val());
    }else{
      alert("You must give your task some text");
    }
  },
  keypress: function(e){
    if(e.key === 'Enter'){
      this.save();
    }
  },
  check: function(event){
    this.model.toggleChecked();
  },
  delete: function(event){
    this.model.destroy();
  },
  moveup: function(){
    let index = tasks.models.indexOf(this.model);
    if(index>0)array_move(tasks.models, index, index-1);
    tasks.sort();
  },
  movedown: function(){
    let index = tasks.models.indexOf(this.model);
    if(index<tasks.models.length)array_move(tasks.models, index, index+1);
    tasks.sort();
  }
});
const AppView = Backbone.View.extend({
  model: tasks,
  initialize: function(){
    this.model.on('add change remove sort', this.render, this);
  },
  events:{
    'click .manager_create-task-button': 'add',
    'keypress .manager_new-task-text': 'pressedKey'
  },
  render: function(){
    this.$('.global-grid_main-content').html('');
    let arr = this.model.toArray();
    _.each(arr, (task)=>{
      this.$('.global-grid_main-content').append((new TaskView({model:task})).render().$el);
    });
    window.localStorage.setItem('todo', JSON.stringify(arr.map(i=>i.toJSON())));
  },
  add: function(){
    let input = $('.manager_new-task-text');
    if(input.val().replace(/\s/g, '')!==''){
      let task = new Task({
        title: input.val()
      });
      tasks.add(task);
      input.val('');
      input.attr('placeholder', 'What should I do?');
    }else{
      alert("You must give your task some text");
    }
  },
  pressedKey: function(e){
    if(e.key === 'Enter'){
      this.add();
    }
  }
});
$(document).ready(()=>{
  let storage = window.localStorage.getItem('todo');
  storage = JSON.parse(storage);
  console.log(storage);
  if(storage){
    storage.forEach((task)=>{
      let todo = new Task({
        title: task.title,
        done: task.done
      });
      tasks.add(todo);
    });
  }
});
const App = new AppView({el: "#global-grid"});